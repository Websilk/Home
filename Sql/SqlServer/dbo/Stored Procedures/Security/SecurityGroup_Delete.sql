CREATE PROCEDURE [dbo].[SecurityGroup_Delete]
	@groupId int
AS
	DELETE FROM [Security] WHERE groupId=@groupId
	DELETE FROM SecurityGroups WHERE groupId=@groupId
