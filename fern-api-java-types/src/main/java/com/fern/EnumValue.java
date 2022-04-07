package com.fern;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderStyle
@JsonDeserialize(as = ImmutableEnumValue.class)
public interface EnumValue extends IWithDocs {

    String value();

    static ImmutableEnumValue.ValueBuildStage builder() {
        return ImmutableEnumValue.builder();
    }
}