NAME="Spinner"
ADDRESS="shared/components/Spinner/Spinner"

IMPORT="import { $NAME } from '$ADDRESS';"
pcregrep  -r -l -M  "$NAME(\n|.)*'react-shared'" ./src | while read -r line ; do
     echo "Processing $line"
#     sed -i "0,/[=\(]/ s/$NAME/kurka_temp/" "$line"
     sed -i "0,/function\|const/ s/$NAME/kurka_temp/" "$line"
     NUMBER=$(grep -n 'react-shared' "$line" | cut -d: -f1 | head -n1)
     LINE_NUMBER=$(($NUMBER+1))
     sed -i "$LINE_NUMBER i $IMPORT" "$line"
     sed -i "s/kurka_temp,//" "$line"
     sed -i "s/kurka_temp//" "$line"
     prettier --write "$line"
     sed -i "/import {} from 'react-shared';/d" "$line"
     prettier --write "$line"
done
