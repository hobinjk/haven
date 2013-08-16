package main

import (
  "fmt"
  "flag"
  "log"
  "net/http"
  "os"
  "runtime/pprof"
  "time"
)

const DEBUG bool = false

var heapprofile = flag.String("heapprofile", "", "write heap profile to file")

func dumpHeap() {
  f, err := os.Create(fmt.Sprintf("haven-heap-%v.prof", time.Now()))
  if err != nil {
    log.Println(err)
    return
  }
  pprof.Lookup("heap").WriteTo(f, 0)
  f.Close()
}

func main() {
  flag.Parse()

  if *heapprofile != "" {
    go func() {
      c := time.Tick(10 * time.Second)
      for _ = range c {
        dumpHeap()
      }
    }()
  }

  notFoundHandler := NewNotFoundHandler()
  fileHandler := NewFileHandler(notFoundHandler)
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
