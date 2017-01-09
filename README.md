# Keyboard Music
A music player and editor based around a computer keyboard for ultimate portability. The precursor to this project: [Online Launchpad](https://github.com/Dan12/Launchpad)

## Dependancies
- [sudo] npm install -g tslint typescript typedoc
- [sudo] gem install sass

## Running
- compile js: tsc -w
- compile css: sass --watch src/styles/stylesheet.sass:lib/stylesheet.css
- run: python -m SimpleHTTPServer 8080

## Documentation
- Will generate a documentation folder. Open the index.html file in the documentation folder to navigate the project docs
- typedoc --out documentation/ --mode file src/main/
