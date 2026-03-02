package main

import (
	"io"
	"log"
	"net/http"
	"strings"
)

func main() {
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	http.HandleFunc("/data", handler)
	http.HandleFunc("/image-proxy", handler)

	log.Println("Server running at http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	apiKey := "R6NnFVcQdcKRVnxiR6YojjR4Enc28dEchUat3P5X"
	if apiKey == "" {
		http.Error(w, "NASA_API_KEY not set", http.StatusInternalServerError)
		return
	}

	switch {
	case r.URL.Path == "/data":
		handleData(w, r, apiKey)
	case r.URL.Path == "/image-proxy":
		handleImageProxy(w, r)
	default:
		http.Error(w, "Not Found", http.StatusNotFound)
	}
}

func handleData(w http.ResponseWriter, r *http.Request, apiKey string) {
	date := r.URL.Query().Get("date")
	random := r.URL.Query().Get("random")

	nasaURL := "https://api.nasa.gov/planetary/apod?api_key=" + apiKey + "&thumbs=true"
	if date != "" {
		nasaURL += "&date=" + date
	}
	if random != "" {
		nasaURL += "&count=1"
	}

	resp, err := http.Get(nasaURL)
	if err != nil {
		http.Error(w, "Failed to fetch NASA API", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}

func handleImageProxy(w http.ResponseWriter, r *http.Request) {
	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		http.Error(w, "Missing url parameter", http.StatusBadRequest)
		return
	}

	if !strings.HasPrefix(targetURL, "http") {
		http.Error(w, "Invalid url", http.StatusBadRequest)
		return
	}

	resp, err := http.Get(targetURL)
	if err != nil {
		http.Error(w, "Failed to fetch image", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	w.Header().Set("Content-Type", contentType)
	io.Copy(w, resp.Body)
}
