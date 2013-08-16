package main

import (
  "bytes"
	"crypto/rand"
	"encoding/hex"
	"io"
	"log"
  "github.com/golang/groupcache/lru"
	"net/http"
	"os"
	"path"
  "time"
)

const UID_LENGTH = 20

type FileHandler struct {
	uids      chan string
  notFound http.Handler
  reaper *Reaper
  cache *lru.Cache
}

type NotFoundInfo struct {
	Path string
}

type CacheEntry struct {
  data []byte
  name string
  lastModified time.Time
}

func IsValidUID(uid string) bool {
	return len(uid) == UID_LENGTH*2
}

func MakePathFromUID(uid string) (string, bool) {
  if !IsValidUID(uid) {
    return "", false
  }
  return path.Join("data", string(uid[0]), string(uid[1]), uid), true
}

func (f *FileHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		// File will be retrieved if possible
		uid := r.URL.Path
		if !IsValidUID(uid) {
      if DEBUG {
        log.Println(uid, " is not a valid UID")
      }
			f.notFound.ServeHTTP(w, r)
			return
		}
		f.cachedGet(w, r, uid)
	case "POST":
		// File will be uploaded
		uid := <-f.uids
    f.cachedPost(w, r, uid)
		// Write it or something
	}
}

func (f *FileHandler) GenerateUIDs() {
	for {
		uid := make([]byte, UID_LENGTH)
		io.ReadFull(rand.Reader, uid)
		f.uids <- hex.EncodeToString(uid)
	}
}

func (f *FileHandler) cachedGet(w http.ResponseWriter, r *http.Request, uid string) {
  filePath, ok := MakePathFromUID(uid)
  if !ok {
    f.notFound.ServeHTTP(w, r)
    return
  }

  if _, err := os.Stat(filePath); os.IsNotExist(err) {
    f.notFound.ServeHTTP(w, r)
    return
  }


  cachebuf, ok := f.cache.Get(uid)
  if ok {
    cacheEntry, ok := cachebuf.(CacheEntry)
    if ok {
      http.ServeContent(w, r, uid, cacheEntry.lastModified, bytes.NewReader(cacheEntry.data))
      return
    }
  }

  file, err := os.Open(filePath)
  if err != nil {
    f.notFound.ServeHTTP(w, r)
    return
  }

  stat, err := os.Stat(filePath)
  if err != nil {
    f.notFound.ServeHTTP(w, r)
    log.Fatal(err)
    return
  }
  buf := bytes.NewBuffer(make([]byte, 0, stat.Size()))
  io.Copy(buf, file)
  file.Close()
  http.ServeContent(w, r, uid, stat.ModTime(), bytes.NewReader(buf.Bytes()))
  f.cache.Add(uid, CacheEntry{buf.Bytes(), uid, stat.ModTime()})
}

func (f *FileHandler) cachedPost(w http.ResponseWriter, r *http.Request, uid string) {
  filePath, ok := MakePathFromUID(uid)
  if !ok {
    if DEBUG {
      log.Println("invalid uid", uid);
    }
    http.Error(w, "unable to create file", 500)
    return
  }
  os.MkdirAll(path.Dir(filePath), 0775)
  file, err := os.Create(filePath)
  if err != nil {
    if DEBUG {
      log.Println(err)
    }
    http.Error(w, "unable to create file", 500)
    return
  }
  buf := bytes.NewBuffer(make([]byte, 0, r.ContentLength))
  io.Copy(buf, r.Body)
  f.cache.Add(uid, CacheEntry{buf.Bytes(), uid, time.Now()})
  io.Copy(file, buf)
  file.Close()
  io.WriteString(w, "/fetch/"+uid);
  f.reaper.Track(file.Name(), 24*time.Hour)

  if DEBUG {
    log.Println("saved file ", filePath)
  }
}



