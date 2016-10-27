CREATE TABLE [dbo].[Components] (
    [componentId] NVARCHAR (25)  NOT NULL,
    [userId]    INT            NOT NULL,
    [title]       NVARCHAR (25)  NOT NULL,
    [category]    INT            NOT NULL,
    [description] NVARCHAR (250) NOT NULL,
    [datecreated] DATETIME       NOT NULL,
    [orderindex]      INT            NOT NULL, 
    CONSTRAINT [PK_Components] PRIMARY KEY ([componentId])
);


GO

CREATE INDEX [index_components] ON [dbo].[Components] (componentId)
