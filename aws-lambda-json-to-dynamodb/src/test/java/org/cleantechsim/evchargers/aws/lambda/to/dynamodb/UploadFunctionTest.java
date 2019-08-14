package org.cleantechsim.evchargers.aws.lambda.to.dynamodb;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.junit.Test;

public class UploadFunctionTest {

	@Test
	public void testConvert() throws IOException {
		
		try (InputStream stream = getClass().getResourceAsStream("/test.json")) {
		
			/*
			final ByteArrayOutputStream baos = new ByteArrayOutputStream();
			
			final byte [] buf = new byte[10000];

			for (;;) {
				final int bytesRead = stream.read(buf);
				
				if (bytesRead < 0) {
					break;
				}
				
				baos.write(buf, 0, bytesRead);
			}

			UploadFunction.convertJson(new String(baos.toByteArray()));
			*/

			UploadFunction.convertJson(stream);
			
		}
	}
}
