import { ResourceForm } from './components/ResourceForm';
import { ResourceFormWrapper } from './components/Wrapper';
import { SingleForm } from './components/Single';
import { Label } from './components/Label';
import { FormField } from './components/FormField';
import { Title } from './components/Title';
import { CollapsibleSection } from './components/CollapsibleSection';

ResourceForm.Single = SingleForm;
ResourceForm.Wrapper = ResourceFormWrapper;
ResourceForm.CollapsibleSection = CollapsibleSection;
ResourceForm.Label = Label;
ResourceForm.FormField = FormField;
ResourceForm.Title = Title;

export { ResourceForm };

// ResourceForm.TextArrayInput = FormComponents.TextArrayInput;
// ResourceForm.ItemArray = FormComponents.ItemArray;
// ResourceForm.ComboboxArrayInput = FormComponents.ComboboxArrayInput;
// ResourceForm.KeyValueField = FormComponents.KeyValueField;

// ResourceForm.K8sNameField = FormComponents.K8sNameField;
