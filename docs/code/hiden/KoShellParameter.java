package com.koy.koshell.command.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * for the parameter of the ShellMethod
 * e.g
 * #KoGroupCommand
 * #KoShellMethod(prefix="-")
 * run(@ KoShellParameter ( key = " h ") host)
 *
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.PARAMETER)
public @interface KoShellParameter {

    String NONE = "__NONE__";
    String NAME = "__NAME__";

    // parameter type
    Class<?> type() default String.class;

    // parameter key, default the parameter name
    String[] key() default {};

    // is this parameter optional, will be ignored when the default value is set
    boolean isOptional() default false;

    // default value
    String defaultValue() default NONE;

    // size
    int arity() default 1;

}
