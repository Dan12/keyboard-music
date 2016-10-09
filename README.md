# Keyboard Music

## Dependancies
- [sudo] npm install -g tslint typescript yuidocjs
- [sudo] gem install sass

## Running
- compile js: tsc -w
- compile css: sass --watch src/styles/stylesheet.sass:lib/stylesheet.css
- run: python -m SimpleHTTPServer 8080

## Documentation
- yuidoc --server ./lib
