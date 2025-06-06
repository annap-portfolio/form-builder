# FormBuilder

This is a form builder application built using Angular. It allows users to visually construct dynamic forms by adding, editing, grouping, and rearranging fields. The underlying model is fully serialisable and supports live Angular code generation.

## Functionality Overview

### Form Construction

- Create forms dynamically using a visual drag-and-drop interface.
- Add fields of various types: text, textarea, number, password, checkbox, radio, and date.
- Group fields together to create nested structures.
- Edit field properties including label, default value, and validation rules.
- Rearrange fields and groups using drag-and-drop.
- Ungroup individual fields or flatten entire groups.

### Field Types Supported

- Text
- Textarea
- Number
- Password
- Checkbox
- Radio
- Date
- Group (for nesting fields)

### Persistence & State

- Forms are automatically saved to `localStorage`
- Existing forms are rehydrated on app load

### Angular Code Generation

- Generates valid Angular `FormGroup` structure based on the form model
- Outputs control configuration including validators
- Generates corresponding Angular template HTML
- Designed to be integrated with the Angular Reactive Forms API

## Technical Details

### Project Structure

- `FormDefinition`: The root model representing the entire form
- `Field`: Represents an individual input control
- `Group`: Container for nested fields
- `FormElement`: A union type of `Field | Group`
- `ValidatorConfig`: Defines rules like `required`, `minLength`, etc.

### Drag and Drop

- Built with `primeng/dragdrop`
- Drag-and-drop operations are handled via a dedicated `DragDropService`

## Development

### Run Locally

```bash
npm install
ng serve
```

Open localhost:4200.

## Running unit tests

```bash
ng test
```
