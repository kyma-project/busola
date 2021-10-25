npm run bootstrap

echo 'Build core'
npm run build --prefix=core
echo 'Build core-ui'
npm run build --prefix=core-ui
echo 'Build service-catalog'
npm run build --prefix=service-catalog-ui

mkdir build
cp -r core/src/* build
cp -r core-ui/build build/core-ui
cp -r service-catalog-ui/build build/service-catalog-ui
