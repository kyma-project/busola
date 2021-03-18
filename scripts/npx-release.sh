
# make a backup of backend package.json
cp ../backend/package.json ../backend/package-org.json

# get values from current root package.json and set them into target package.json
NAME=$(jq -r '.name' ../package.json)
VERSION=$(jq -r '.version' ../package.json)
echo $(jq ". |= . + {\"version\": \"$VERSION\", \"name\": \"$NAME\"}" ../backend/package.json) > ../backend/package.json

npm publish ../backend

# restore backend package.json
mv ../backend/package-org.json ../backend/package.json
