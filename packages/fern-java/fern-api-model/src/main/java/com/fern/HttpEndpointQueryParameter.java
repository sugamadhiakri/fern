package com.fern;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import com.fern.interfaces.IWithDocs;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(
    as = ImmutableHttpEndpointQueryParameter.class
)
@JsonIgnoreProperties({"_type"})
public interface HttpEndpointQueryParameter extends IWithDocs {
  String key();

  TypeReference valueType();

  static ImmutableHttpEndpointQueryParameter.KeyBuildStage builder() {
    return ImmutableHttpEndpointQueryParameter.builder();
  }
}