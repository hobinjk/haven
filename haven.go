package main

import (
  "log"
  "net/http"
)

func main() {
  log.Println("merble")
  notFoundHandler := NewNotFoundHandler()
  fileHandler := &FileHandler{make(chan string), notFoundHandler}
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
