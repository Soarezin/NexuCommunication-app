# Lista de componentes Shadcn que você deseja instalar
$components = @(
  "button",
  "input",
  "label",
  "textarea",
  "card",
  "dialog",
  "tooltip",
  "dropdown-menu",
  "select",
  "switch",
  "table",
  "tabs"
)

foreach ($component in $components) {
  Write-Host "Instalando: $component"
  npx shadcn-ui@latest add $component
}

Write-Host "Todos os componentes foram instalados com sucesso."
