package org.cleantechsim.evchargers.spring.server.rest.model;

public class ChargingFilter {

	private String countryCode;
	
	private Integer minChargePower;
	
	private Integer maxChargePower;

	public String getCountryCode() {
		return countryCode;
	}

	public void setCountryCode(String countryCode) {
		this.countryCode = countryCode;
	}

	public Integer getMinChargePower() {
		return minChargePower;
	}

	public void setMinChargePower(Integer minChargePower) {
		this.minChargePower = minChargePower;
	}

	public Integer getMaxChargePower() {
		return maxChargePower;
	}

	public void setMaxChargePower(Integer maxChargePower) {
		this.maxChargePower = maxChargePower;
	}
}
