package org.cleantechsim.evchargers.aws.lambda.to.dynamodb;

import java.io.IOException;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.Test;

public class UploadFunctionTest {

	@Test
	public void testConvert() throws IOException {
		
		try (InputStream stream = getClass().getResourceAsStream("/test.json")) {

			assertThat(UploadFunction.convertJson(stream).size()).isEqualTo(1);
			
		}
	}
}
