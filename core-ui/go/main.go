package main

import (
	"fmt"

	"github.com/datreeio/datree/pkg/jsonSchemaValidator"
)

func main() {
	jsv := jsonSchemaValidator.New()

	x := 
	`napiVersion: v1
	 policies:
	  - name: "policy1"
		isDefault: true
	  - name: "policy1"`

	  schema := `type: object
	  properties:
		apiVersion:
		  type: string
	  required:
		- apiVersion`

	_, err := jsv.ValidateYamlSchema(schema, x)
	if err != nil {
		fmt.Printf("err %v", err)
	}

}
