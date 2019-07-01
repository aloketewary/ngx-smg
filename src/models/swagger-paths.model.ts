export class SwaggerServicePaths {
  [key: string]: ServiceOperationType
}

export class ServiceOperationType {
  [key: string]: ServiceOperationTypeData
}

export class ServiceParameter {
  in?: string
  name?: string
  description?: string
  required?: boolean
  type?: string
  format?: string
  schema?: {
    $ref?: string
  }
}

export class ServiceOperationTypeData {
  tags?: string[]
  summary?: string
  description?: string
  operationId?: string
  consumes?: string[]
  produces?: string[]
  parameters?: ServiceParameter[]
  responses?: any
  security?: any[]
}
