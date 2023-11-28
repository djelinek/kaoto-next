import { JSONSchemaType } from 'ajv';
import { ICamelComponentProperty } from '../../../camel-components-catalog';
import { ICamelLanguageProperty } from '../../../camel-languages-catalog';
import { ICamelProcessorProperty } from '../../../camel-processors-catalog';
import { IKameletDefinition } from '../../../kamelets-catalog';

export class NodeDefinitionService {
  /**
   * Transform Camel Common properties into a JSON Schema
   */
  static getSchemaFromCamelCommonProperties(
    properties?: Record<string, ICamelProcessorProperty | ICamelComponentProperty | ICamelLanguageProperty>,
  ): JSONSchemaType<unknown> {
    if (!properties) {
      return {} as unknown as JSONSchemaType<unknown>;
    }
    const required: string[] = [];
    const schema = {
      type: 'object',
      properties: {},
      required,
    } as unknown as JSONSchemaType<unknown>;

    Object.keys(properties).forEach((propertyName) => {
      const property = properties[propertyName];
      const propertyType = this.getJSONType(property);
      const propertySchema = {
        type: propertyType,
        title: property.displayName,
        description: property.description,
        deprecated: property.deprecated,
      } as unknown as JSONSchemaType<unknown>;

      if (property.enum !== undefined) {
        propertySchema.enum = property.enum;
      }

      if (property.required) {
        required.push(propertyName);
      }

      schema.properties[propertyName] = propertySchema;
    });

    return schema;
  }

  /**
   * Transform a Kamelet definition into a JSON Schema
   */
  static getSchemaFromKameletDefinition(definition: IKameletDefinition | undefined): JSONSchemaType<unknown> {
    const required: string[] = [];
    const schema = {
      type: 'object',
      properties: {},
      required,
    } as unknown as JSONSchemaType<unknown>;
    const properties = definition?.spec.definition.properties;
    if (!properties) {
      return schema;
    }

    Object.keys(properties).forEach((propertyName) => {
      const property = properties[propertyName];
      const propertySchema = {
        type: property.type,
        title: property.title,
        description: property.description,
      } as unknown as JSONSchemaType<unknown>;

      schema.properties[propertyName] = propertySchema;
    });

    if (definition.spec.definition.required) {
      required.push(...definition.spec.definition.required);
    }

    return schema;
  }

  /**
   * Transform Camel property types into JSON Schema types
   *
   * This is needed because the Camel Catalog is using different types than JSON Schema
   * For instance, the Camel Catalog is using `duration` instead of `number`
   */
  private static getJSONType(property: ICamelProcessorProperty | ICamelComponentProperty): string | undefined {
    /** Camel defines enum as a type, whereas it should be string and let uniforms handle the right field */
    if (Array.isArray(property.enum)) {
      return undefined;
    }

    switch (property.type) {
      /** Camel defines duration as string since it supports placeholders */
      case 'duration':
        return 'string';

      default:
        return property.type;
    }
  }
}