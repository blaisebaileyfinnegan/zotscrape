CREATE TABLE instructors (
    instructor_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(64) NOT NULL,
    PRIMARY KEY (instructor_id),
    UNIQUE KEY instructors_key (name)
);

CREATE TABLE sections2instructors (
    s2i_id INT NOT NULL AUTO_INCREMENT,
    section_id INT NOT NULL,
    instructor_id INT NOT NULL,
    PRIMARY KEY (s2i_id),
    UNIQUE KEY s2i_key (section_id, instructor_id),
    FOREIGN KEY (section_id) REFERENCES sections(section_id),
    FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id)
);


