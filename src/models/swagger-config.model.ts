import { Deserializable } from './deserializable.interface';

export class SwaggerConfig implements Deserializable {
  'location': string
  'format': 'yml' | 'json'
  'output': string

  withFormat(format: 'yml' | 'json'): SwaggerConfig {
    this.format = format
    return this
  }

  withLocation(location: string): SwaggerConfig {
    this.location = location
    return this
  }

  withOutput(output: string): SwaggerConfig {
    this.output = output
    return this
  }

  deserialize(input: any) {
    Object.assign(this, input)
    return this
  }
}
