import { FileInput } from 'shared/components/FileInput/FileInput';

export function YamlFileUploader({
  onYamlContentAdded,
}: {
  onYamlContentAdded: (content: string) => void;
}) {
  const readFile = (file: File) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e?.target?.result as string);
      reader.readAsText(file);
    });
  };

  const onYamlContentUploaded = (files: FileList) => {
    void Promise.all([...files]?.map(readFile))
      .then((contents) => {
        onYamlContentAdded(contents.join('\n---\n'));
      })
      .catch((e) => console.error(e));
  };

  return (
    <FileInput
      fileInputChanged={onYamlContentUploaded}
      acceptedFileFormats=".yaml,.yml"
      allowMultiple
    />
  );
}
