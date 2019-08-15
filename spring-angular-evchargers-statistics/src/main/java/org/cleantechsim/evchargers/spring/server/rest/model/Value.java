package org.cleantechsim.evchargers.spring.server.rest.model;

public abstract class Value {

	private final String displayName;
	
	public Value(String displayName) {
		this.displayName = displayName;
	}

	public final String getDisplayName() {
		return displayName;
	}
}
