#!/usr/bin/bash

mkdir -p dist/assets
babel --out-dir dist src &&
browserify dist/demo.js -o dist/assets/demo.js && 
cp src/demo.html dist && 
cp src/demo.css dist

