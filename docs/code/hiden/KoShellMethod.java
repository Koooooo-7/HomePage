package com.koy.koshell.command.annotation;

import org.springframework.core.convert.converter.Converter;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface KoShellMethod {

    // the description for current method
    String value();

    String[] key() default {};

    String prefix() default "-";

    // when a method has own converter, it will convert parameters by this directly
//    Class<? extends Converter> converter() default NoConverter.class;
//
//    class NoConverter<S, T> implements org.springframework.core.convert.converter.Converter<S, T> {
//        @Override
//        public T convert(S s) {
//            return (T) s;
//        }
//    }

    // TODO: support sub group
}
