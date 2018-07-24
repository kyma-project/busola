OLDVERSION=$(cat package.json | jq ".version")
echo old version: $OLDVERSION
read -p "Provide a new version: " NEWVERSION
npm version --no-git-tag-version -- $NEWVERSION
echo new version: $NEWVERSION
CURRENTBRANCH=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
git commit -a -m "Console version updated to: '$NEWVERSION'"
git push origin $CURRENTBRANCH
