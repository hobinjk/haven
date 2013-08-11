package main

import (
	"net/http"
  "strings"
  "os"
)

type FetchHandler struct {
  notFound http.Handler
}

type FetchTemplateInfo struct {
  UID string
}

func (f *FetchHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
  pathComps := strings.Split(r.URL.Path, "/")
  uid := pathComps[len(pathComps)-1]

  path, ok := MakePathFromUID(uid)
  if !ok {
    f.notFound.ServeHTTP(w, r)
    return
  }

  _, err := os.Stat(path)
  if os.IsNotExist(err) {
    f.notFound.ServeHTTP(w, r)
    return
  }

	http.ServeFile(w, r, "public/fetch.html")
}
