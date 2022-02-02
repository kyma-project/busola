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
	helmDto := js.Global().Get("helmDto")

	t := []*chart.Template{}
	templates := helmDto.Get("templates")
	for i := 0; i < templates.Length(); i++ {
		template := templates.Index(i)
		name := template.Get("name").String()
		data := template.Get("data").String()
		t = append(t, &chart.Template{Name: name, Data: []byte(data)})
	}
	metadata := helmDto.Get("metadata").String()
	values := helmDto.Get("values").String()

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

	renderedTemplates, err := renderutil.Render(c, config, renderOpts)
	if err != nil {
		fmt.Printf("ERROR: %v\n", err)
	}

	result := js.Global().Get("Object").New()
	for name, template := range renderedTemplates {
		result.Set(name, template)
	}
	helmDto.Set("result", result)
	return nil
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
