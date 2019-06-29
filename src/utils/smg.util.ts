import { PropertyTypeObj } from '../models/swagger.schemas.model';

export function getType(propertyType: PropertyTypeObj): string {
  // console.log(JSON.stringify(propertyType))
  let rtrnType: string
  switch (propertyType.type) {
    case 'array':
      rtrnType = propertyType.items.$ref ? `${propertyType.items.$ref.split('/')[2]}[]` : 'any[]'
      break
    case 'object':
      rtrnType = propertyType.items ? propertyType.items.$ref ? propertyType.items.$ref.split('/')[2] : 'any' : 'any'
      break
    case 'string':
      rtrnType = propertyType.format === 'date-time' ? 'Date' : 'string'
      break
    case 'integer':
      rtrnType = 'number'
      break
    case 'boolean':
      rtrnType = 'boolean'
      break
    default:
      rtrnType = propertyType.$ref ? (propertyType.$ref as unknown as string).split('/')[2] : 'any'
  }
  return rtrnType
}

export function isNullOrUndefined(elem: any): boolean {
  return elem === null || elem === undefined
}


export function getImportsType(propertyType: PropertyTypeObj): string {
  // console.log(JSON.stringify(propertyType))
  let rtrnType: string
  switch (propertyType.type) {
    case 'array':
      rtrnType = propertyType.items.$ref ? `${propertyType.items.$ref.split('/')[2]}` : 'any'
      break
    case 'object':
      rtrnType = propertyType.items ? propertyType.items.$ref ? propertyType.items.$ref.split('/')[2] : 'any' : 'any'
      break
    default:
      rtrnType = propertyType.$ref ? (propertyType.$ref as unknown as string).split('/')[2] : 'any'
  }
  return rtrnType
}


export function getServiceType(propertyType: string, schema: string | undefined): string {
  // console.log(JSON.stringify(propertyType))
  let rtrnType: string
  switch (propertyType) {
    case 'array':
      rtrnType = schema ? `${titleCase(schema)}[]` : 'any[]'
      break
    case 'object':
      rtrnType = schema ? `${titleCase(schema)}[]` : 'any'
      break
    case 'string':
      rtrnType = schema === 'date-time' ? 'Date' : 'string'
      break
    case 'integer':
      rtrnType = 'number'
      break
    case 'boolean':
      rtrnType = 'boolean'
      break
    default:
      rtrnType = schema ? `${titleCase(schema)}` : 'any'
  }
  return rtrnType
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1, str.length).toLowerCase();
}

export function titleCase(str: string) {
  return str.replace(/[^\ \/\-\_]+/g, capitalize)
}
