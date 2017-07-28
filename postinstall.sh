#!/usr/bin/bash

mkdir -p dist/demo
babel --out-dir dist src &&
browserify dist/demo.js -o dist/demo/demo.js && 
browserify dist/react-action-state-path.js -o dist/demo/react-action-state-path.js &&
cp src/demo.html dist/demo && 
cp src/demo.css dist/demo

