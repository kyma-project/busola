// package main

// import (
// 	"fmt"
// 	"github.com/datreeio/datree/pkg/jsonSchemaValidator"
// 	"syscall/js"
// )

// func ValidateUserYaml() js.Func {
// 	jsv := jsonSchemaValidator.New()

// 	x :=
// 		`napiVersion: v1
// 	 policies:
// 	  - name: "policy1"
// 		isDefault: true
// 	  - name: "policy1"`

// 	schema := `type: object
// 	  properties:
// 		apiVersion:
// 		  type: string
// 	  required:
// 		- apiVersion`

// 	_, err := jsv.ValidateYamlSchema(schema, x)
// 	if err != nil {
// 		fmt.Printf("err %v", err)
// 	}
// 	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
// 		return "hello"
// 	})
// }

// func registerCallbacks() {
// 	js.Global().Set("validateUserYaml", ValidateUserYaml)
// }

// func main() {

// 	c := make(chan struct{})

// 	println("WASM Go Initialized")
// 	// register functions
// 	registerCallbacks()
// 	<-c
// }

package main

import (
	"fmt"
	"syscall/js"
)

var htmlString = `<h4>Hello, I'm an HTML snippet from Go!</h4>`

func GetHtml() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		return htmlString
	})
}

func main() {

	ch := make(chan struct{}, 0)
	fmt.Printf("Hello Web Assembly from Go hahaha!\n")

	js.Global().Set("getHtml", GetHtml())
	<-ch
}
