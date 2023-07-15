CREATE TABLE IF NOT EXISTS jnu_bot (
    ID INT NOT NULL,
    site TEXT NOT NULL,
    json TEXT DEFAULT '[]'
);

INSERT INTO jnu_bot(ID, site, json)
VALUES
    (1, 'soe.jnu.ac.in', '[]'),
    (2, 'jnu.ac.in/iha-notices', '[]'),
    (3, 'jnu.ac.in/notices', '[]'),
    (4, 'soe.jnu.ac.in/for-students/examination-and-results', '[]');
