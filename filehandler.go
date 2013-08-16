package main

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"log"
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
}

type NotFoundInfo struct {
	Path string
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
		urlPath := r.URL.Path
		log.Println("serving GET to ", urlPath)
		if !IsValidUID(urlPath) {
			log.Println(urlPath, " is not a valid UID")
			f.notFound.ServeHTTP(w, r)
			return
		}

		filePath, ok := MakePathFromUID(urlPath)
    if !ok {
      f.notFound.ServeHTTP(w, r)
      return
    }

    if _, err := os.Stat(filePath); os.IsNotExist(err) {
			f.notFound.ServeHTTP(w, r)
			return
		}

		http.ServeFile(w, r, filePath)
	case "POST":
		// File will be uploaded
		uid := <-f.uids
    filePath, ok := MakePathFromUID(uid)
    if !ok {
      log.Println("invalid uid", uid);
			http.Error(w, "unable to create file", 500)
			return
		}
		os.MkdirAll(path.Dir(filePath), 0775)
		file, err := os.Create(filePath)
		if err != nil {
			log.Println(err)
			http.Error(w, "unable to create file", 500)
			return
		}
		// Write it or something
		io.Copy(file, r.Body)
		log.Println("saved file ", filePath)
    io.WriteString(w, "/fetch/"+uid);
		// http.Redirect(w, r, "/fetch/"+uid, 303) //see other
    f.reaper.Track(filePath, 24*time.Hour)
	}
}

func (f *FileHandler) GenerateUIDs() {
	for {
		uid := make([]byte, UID_LENGTH)
		io.ReadFull(rand.Reader, uid)
		f.uids <- hex.EncodeToString(uid)
	}
}
