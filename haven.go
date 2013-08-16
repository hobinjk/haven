package main

import (
  "log"
  "github.com/golang/groupcache/lru"
  "net/http"
)

const DEBUG bool = false

func main() {
  reaper := &Reaper{make(chan Life)}
  go reaper.Run()

  notFoundHandler := NewNotFoundHandler()
  fileHandler := &FileHandler{make(chan string), notFoundHandler, reaper, lru.New(32)}
  fetchHandler := &FetchHandler{notFoundHandler}
  go fileHandler.GenerateUIDs()

  http.Handle("/files/", http.StripPrefix("/files/", fileHandler))
  http.Handle("/fetch/", fetchHandler)
  http.Handle("/", http.FileServer(http.Dir("public")))
  err := http.ListenAndServe(":9001", nil)
  if err != nil {
    log.Fatal(err)
  }
}
