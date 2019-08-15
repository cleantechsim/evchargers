package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.Objects;

public abstract class StringValue extends Value {

	private final String value;

	public StringValue(String value, String displayName) {
		
		super(displayName);
		
		Objects.requireNonNull(value);
		
		this.value = value;
	}

	public final String getValue() {
		return value;
	}
}
