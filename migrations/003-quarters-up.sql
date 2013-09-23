CREATE TABLE quarters (
    quarter varchar(3) not null PRIMARY KEY,
    year_term varchar(16) not null,
    UNIQUE KEY quarters_key (year_term)
);

INSERT INTO quarters values('F13', '2013-92');

ALTER TABLE departments ADD CONSTRAINT fk_quarter FOREIGN KEY (quarter) REFERENCES quarters(quarter);
