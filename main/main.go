package main

import (
	"fmt"
	"syscall/js"

	"github.com/ghodss/yaml"
	"k8s.io/helm/pkg/chartutil"
	"k8s.io/helm/pkg/proto/hapi/chart"
	"k8s.io/helm/pkg/renderutil"
	"k8s.io/helm/pkg/timeconv"
)

func render(this js.Value, args []js.Value) interface{} {
	t := []*chart.Template{}
	templates := args[0].Get("templates")
	for i := 0; i < templates.Length(); i++ {
		template := templates.Index(i)
		name := template.Get("name").String()
		data := template.Get("data").String()
		t = append(t, &chart.Template{Name: name, Data: []byte(data)})
	}
	metadata := args[0].Get("metadata").String()
	values := args[0].Get("values").String()

	m := &chart.Metadata{}
	err := yaml.Unmarshal([]byte(metadata), m)
	if err != nil {
		fmt.Printf("cannot unmarshal chart metadata: %v\n", err)
	}
	c := &chart.Chart{
		Metadata:  m,
		Templates: t,
	}
	config := &chart.Config{Raw: values, Values: map[string]*chart.Value{}}

	renderOpts := renderutil.Options{
		ReleaseOptions: chartutil.ReleaseOptions{
			Name:      "wasm",
			IsInstall: false,
			IsUpgrade: false,
			Time:      timeconv.Now(),
			Namespace: "wasm",
		},
		KubeVersion: "1.14",
	}

	result := js.Global().Get("Object").New()

	renderedTemplates, err := renderutil.Render(c, config, renderOpts)
	if err != nil {
		// fmt.Printf("ERROR: %v\n", err)
		result.Set("error", err.Error())
	}

	for _, template := range renderedTemplates {
		result.Set("result", template)
		break
	}
	return result
}

func registerCallbacks() {
	js.Global().Set("render", js.FuncOf(render))
}

func main() {
	c := make(chan struct{}, 0)

	println("WASM Go Initialized")
	// register functions
	registerCallbacks()
	<-c
}
