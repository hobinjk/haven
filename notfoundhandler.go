package main

import (
  "html/template"
  "net/http"
)

type NotFoundHandler struct {
  templates *template.Template;
}

func NewNotFoundHandler() *NotFoundHandler {
  templates := template.Must(template.New("").ParseFiles("public/404.html"))
  return &NotFoundHandler{templates}
}

func (n *NotFoundHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotFound)
  path := r.URL.Path
	n.templates.ExecuteTemplate(w, "404.html", NotFoundInfo{Path: path})
}
