package com.koy.koshell.command;

import com.koy.koshell.command.annotation.KoShellComponentGroup;
import com.koy.koshell.command.annotation.KoShellMethod;
import com.koy.koshell.command.annotation.KoShellParameter;
import org.springframework.shell.table.BeanListTableModel;
import org.springframework.shell.table.BorderStyle;
import org.springframework.shell.table.Table;
import org.springframework.shell.table.TableBuilder;
import org.springframework.shell.table.TableModel;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

@KoShellComponentGroup(value = "command", group = "demo")
public class Demo {

    @KoShellMethod(value = "a test method", prefix = "-")
    public void test() {
        System.out.println(1);
    }


    // demo te -t haha -g 4
    @KoShellMethod(value = "a table method", key = "te", prefix = "-")
    public Table test1(@KoShellParameter(key = "t") String a, @KoShellParameter(key = "g", type = Integer.class) Integer s) {
        System.out.println("this is a---" + a);
        System.out.println("this is s+1---" + s + 1);
        List<Topic> topics = new ArrayList<>();
        topics.add(new Topic("name"));
        LinkedHashMap<String, Object> headers = new LinkedHashMap<>();
        headers.put("name", "Topic");
        TableModel model = new BeanListTableModel<>(topics, headers);
        TableBuilder tableBuilder = new TableBuilder(model);
        tableBuilder.addInnerBorder(BorderStyle.oldschool);
        tableBuilder.addHeaderBorder(BorderStyle.oldschool);
        return tableBuilder.build();

    }

    static class Topic {
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Topic(String name) {
            this.name = name;

        }
    }
}
