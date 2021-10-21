if [ -z "$1" ] ; then  
    echo "No domain passed as first argument, aborting." 
    exit 1
fi

export DOMAIN=$1
export NAMESPACE=${2:-busola}

mkdir -p ../temp/resources
cp -rf . ../temp/resources

envsubst < ../temp/resources/istio/virtualservice-busola-template.yaml > ../temp/resources/istio/virtualservice-busola.yaml

kubectl apply -k ../temp/resources/istio --namespace=$NAMESPACE

