CREATE PROCEDURE [dbo].[SecurityGroup_Create]
	@name nvarchar(30) = '',
	@security binary(32) = null,
	@dateCreated datetime = null
AS

IF @dateCreated = null SET @dateCreated = GETDATE()

DECLARE @id int = NEXT VALUE FOR SequenceSecurityGroups
INSERT INTO SecurityGroups (groupId, [security], [name], dateCreated) VALUES(@id, @security, @name, @dateCreated)
