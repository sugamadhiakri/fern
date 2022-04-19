package com.fern;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.util.Locale;
import javax.annotation.Nonnull;

public final class HttpMethod {
  public static final HttpMethod GET = new HttpMethod(Value.GET, "GET");

  public static final HttpMethod DELETE = new HttpMethod(Value.DELETE, "DELETE");

  public static final HttpMethod POST = new HttpMethod(Value.POST, "POST");

  public static final HttpMethod PUT = new HttpMethod(Value.PUT, "PUT");

  private final Value value;

  private final String string;

  HttpMethod(Value value, String string) {
    this.value = value;
    this.string = string;
  }

  Value getEnumValue() {
    return value;
  }

  @Override
  @JsonValue
  public String toString() {
    return this.string;
  }

  @Override
  public boolean equals(Object other) {
    return (this == other) 
      || (other instanceof HttpMethod && this.string.equals(((HttpMethod) other).string));
  }

  @Override
  public int hashCode() {
    return this.string.hashCode();
  }

  public <T> T accept(Visitor<T> visitor) {
    switch (value) {
      case DELETE:
        return visitor.visitDelete();
      case POST:
        return visitor.visitPost();
      case GET:
        return visitor.visitGet();
      case PUT:
        return visitor.visitPut();
      case UNKNOWN:
      default:
        return visitor.visitUnknown(string);
    }
  }

  @JsonCreator(
      mode = JsonCreator.Mode.DELEGATING
  )
  public static HttpMethod valueOf(@Nonnull String value) {
    String upperCasedValue = value.toUpperCase(Locale.ROOT);
    switch (upperCasedValue) {
      case "GET":
        return GET;
      case "DELETE":
        return DELETE;
      case "POST":
        return POST;
      case "PUT":
        return PUT;
      default:
        return new HttpMethod(Value.UNKNOWN, upperCasedValue);
    }
  }

  public enum Value {
    GET,

    POST,

    PUT,

    DELETE,

    UNKNOWN
  }

  public interface Visitor<T> {
    T visitGet();

    T visitPost();

    T visitPut();

    T visitDelete();

    T visitUnknown(String unknownType);
  }
}