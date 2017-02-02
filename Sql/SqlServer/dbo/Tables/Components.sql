CREATE TABLE [dbo].[Components] (
    [componentId] NVARCHAR (25)  NOT NULL DEFAULT '',
    [namespace]   NVARCHAR(100)	 NOT NULL DEFAULT '', 
    [title]       NVARCHAR (25)  NOT NULL DEFAULT '',
    [category]    INT            NOT NULL,
    [description] NVARCHAR (250) NOT NULL DEFAULT '',
    [datecreated] DATETIME       NOT NULL,
    [orderindex]  INT			 NOT NULL
    CONSTRAINT [PK_Components] PRIMARY KEY ([componentId])
);


GO

CREATE INDEX [index_components] ON [dbo].[Components] (componentId)
