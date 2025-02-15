import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { IdGenerator } from "../IdGenerator";
import { EndpointId, ErrorId, ServiceId, SubpackageId, TypeId } from "./ids";

export interface FilteredIr {
    hasType(type: TypeDeclaration): boolean;
    hasTypeId(type: string): boolean;
    hasError(error: ErrorDeclaration): boolean;
    hasErrorId(type: string): boolean;
    hasService(service: HttpService): boolean;
    hasServiceId(type: string): boolean;
    hasEndpoint(service: HttpService, endpoint: HttpEndpoint): boolean;
    hasSubpackageId(subpackageId: string): boolean;
}

export class FilteredIrImpl implements FilteredIr {
    private types: Set<TypeId> = new Set();
    private errors: Set<ErrorId> = new Set();
    private services: Set<ServiceId> = new Set();
    private endpoints: Set<EndpointId> = new Set();
    private subpackages: Set<SubpackageId> = new Set();

    public constructor({
        types,
        errors,
        services,
        endpoints,
        subpackages,
    }: {
        types: Set<TypeId>;
        errors: Set<ErrorId>;
        services: Set<ServiceId>;
        endpoints: Set<EndpointId>;
        subpackages: Set<SubpackageId>;
    }) {
        this.types = types;
        this.errors = errors;
        this.services = services;
        this.endpoints = endpoints;
        this.subpackages = subpackages;
    }

    public hasTypeId(typeId: string): boolean {
        return this.types.has(typeId);
    }
    public hasErrorId(errorId: string): boolean {
        return this.errors.has(errorId);
    }
    public hasServiceId(serviceId: string): boolean {
        return this.services.has(serviceId);
    }

    public hasSubpackageId(subpackageId: string): boolean {
        return this.subpackages.has(subpackageId);
    }

    public hasType(type: TypeDeclaration): boolean {
        const typeId = IdGenerator.generateTypeId(type.name);
        return this.types.has(typeId);
    }

    public hasError(error: ErrorDeclaration): boolean {
        const errorId = IdGenerator.generateErrorId(error.name);
        return this.errors.has(errorId);
    }

    public hasService(service: HttpService): boolean {
        const serviceId = IdGenerator.generateServiceId(service.name);
        return this.services.has(serviceId);
    }

    public hasEndpoint(service: HttpService, endpoint: HttpEndpoint): boolean {
        const endpointId = IdGenerator.generateEndpointId(service.name, endpoint);
        return this.endpoints.has(endpointId);
    }

    public hasSubpackage(subpackageId: string): boolean {
        return this.subpackages.has(subpackageId);
    }
}
