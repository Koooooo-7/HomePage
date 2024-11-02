# ksqlDB 

[quickstart](https://ksqldb.io/quickstart-platform.html#quickstart-content)

---
[How Real-Time Stream Processing Works with ksqlDB, Animated](https://www.confluent.io/blog/how-real-time-stream-processing-works-with-ksqldb/)

```
 CREATE STREAM orders_enriched_table_s AS
  SELECT
    orderId,
    COLLECT_LIST('{ "id" : "' + itemId + '", "name" : "' + ItemName + '"}') AS inner_items
  FROM orders_enriched_items_stream
  PARTITION BY orderId ;
  ```