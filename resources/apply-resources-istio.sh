if [ -z "$1" ] ; then  
    echo "No domain passed as first argument, aborting." 
    exit 1
fi

namespace=${2:-busola}

mkdir -p ../temp/resources

cp -rf . ../temp/resources

for i in ../temp/resources/**{/*,}.yaml; do
    sed -i '' "s/%DOMAIN%/$1/g" $i
done

for i in ../temp/resources/**{/*,}.yaml; do
    sed -i '' "s/%NAMESPACE%/$2/g" $i
done

kubectl apply -k ../temp/resources/istio --namespace=$namespace

