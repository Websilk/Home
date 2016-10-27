CREATE TABLE [dbo].[Log] (
    [websiteid]   INT            NOT NULL,
    [pageid]      INT            NULL,
    [loadtime]    FLOAT (53)     NOT NULL,
    [ajax]        BIT            NOT NULL,
    [visitorId]   NVARCHAR (5)   NOT NULL,
    [userid]    INT            NULL,
    [ipaddress]   NVARCHAR (25)  NULL,
    [domain]      NVARCHAR (50)  NOT NULL,
    [url]         NVARCHAR (200) NOT NULL,
    [agent]       NVARCHAR (200) NOT NULL,
    [referrer]    NVARCHAR (200) NULL,
    [firstvisit]  BIT            NOT NULL,
    [components]  INT            NOT NULL,
    [apps]        INT            NOT NULL,
    [layers]  INT            NOT NULL,
    [sqlqueries]  INT            NOT NULL,
    [ctext]       INT            NOT NULL,
    [cphotos]     INT            NOT NULL,
    [cgalleries]  INT            NOT NULL,
    [cpanels]     INT            NOT NULL,
    [cmenus]      INT            NOT NULL,
    [datecreated] DATETIME       NOT NULL,
    [editor]      BIT            NOT NULL,
    [dash]        BIT            NOT NULL, 
    CONSTRAINT [PK_Log] PRIMARY KEY ([websiteid])
);


GO

CREATE INDEX [index_log] ON [dbo].[Log] (websiteid, datecreated DESC)
