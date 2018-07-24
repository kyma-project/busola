#!/bin/bash

set -e

npm run build
cd ../..
git checkout master
git subtree split --prefix=components/react/docs -b gh-pages    
git push -f origin gh-pages:gh-pages
git branch -D gh-pages