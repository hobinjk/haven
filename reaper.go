package main

import (
  "time"
  "os"
  "log"
)

type Reaper struct {
  lives chan Life
}

type Life struct {
  Path string
  Death <-chan time.Time
}

func (r *Reaper) Run() {
  for {
    life := <- r.lives
    go func() {
      <-life.Death
      log.Println("Reaping ", life.Path)
      err := os.Remove(life.Path)
      if err != nil {
        log.Fatal(err)
      }
    }();
  }
}

func (r *Reaper) Track(path string, lifespan time.Duration) {
  death := time.After(lifespan)
  r.lives <- Life{path, death}
}
