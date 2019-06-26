
export class SwaggerSchemasModel {
  [name: string]: ObjectDefination;
}

export class ObjectDefination {
  'type': 'object'
  'required': string[]
  'properties': PropertyType
  'xml': GenericClass
  'description': string

  constructor() {
    this.xml = new GenericClass()
  }
}

export class GenericClass {
  [name: string]: string
}

export class PropertyType {
  [key: string]: PropertyTypeObj
}

export class PropertyTypeObj {
  'type': 'array' | 'string' | 'integer' | 'object' | 'boolean'
  'format': any
  'position': number
  'items': {
    '$ref': string
  }
  '$ref': string
}
