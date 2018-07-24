VERSION=$(cat package.json | jq ".version")
VERSION="${VERSION%\"}"
VERSION="${VERSION#\"}"
echo Tagging version: $VERSION
git tag -a $VERSION -m "$VERSION"
git push origin $VERSION
