package com.koy.koshell.command.annotation;

import org.springframework.stereotype.Component;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Component
public @interface KoShellComponentGroup {

    String DEFAULT = "__DEFAULT__";

    // whether as the group command, default true
    boolean asGroupCommand() default true;

    // group name
    String group() default DEFAULT;

    // description
    String value();
}
